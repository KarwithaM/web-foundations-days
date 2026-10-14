# TicketHub System Design

## 1. Requirements

**Functional:**

- Users can browse upcoming events and view interactive seat maps.
- Users can select and temporarily "hold" seats.
- Users can checkout and pay for held seats.
- Users can view their purchased tickets in their profile.

**Non-Functional:**

- **Correctness & Consistency:** The system must strictly prevent double-booking (two users buying the same seat).
- **Performance:** Seat maps must load in under 200ms.
- **Fairness:** During flash sales, the system should operate on a first-come-first-served basis.
- **Scalability:** The system must survive massive traffic spikes when popular tickets go on sale.

## 2. Estimates

**Normal Day Traffic:**

- 50,000 visitors \* 10 pages = 500,000 page views/day.
- 500,000 / 100,000 seconds = **5 reads/sec**.
- 5,000 tickets sold / 100,000 seconds = **0.05 writes/sec**.

**"Big Sale" Peak Traffic (200,000 users in 10 mins / 600 seconds):**

- 200,000 users \* 10 pages = 2,000,000 reads.
- 2,000,000 / 600 seconds = **~3,333 reads/sec**.
- 20,000 tickets / 600 seconds = **~33 writes/sec**.
  _(Note: While 33 writes/sec is low, the intense concurrency on specific seat rows creates a massive database locking bottleneck)._

## 3. API Endpoints

| Method | Path                  | Description                                       | Success Status |
| :----- | :-------------------- | :------------------------------------------------ | :------------- |
| `GET`  | `/events`             | List upcoming events.                             | `200 OK`       |
| `GET`  | `/events/{id}/seats`  | Get the seat map and availability for an event.   | `200 OK`       |
| `POST` | `/events/{id}/holds`  | Temporarily hold selected seats for checkout.     | `201 Created`  |
| `POST` | `/orders`             | Process payment and finalize the ticket purchase. | `201 Created`  |
| `GET`  | `/users/{id}/tickets` | View purchased tickets for a specific user.       | `200 OK`       |

## 4. Data Model

- **users**: (id, name, email)
- **events**: (id, name, date, venue)
- **seats**: (id, event_id, row, seat_number, status) -> _status: 'available', 'held', 'sold'_
- **orders**: (id, user_id, seat_id, amount, status, created_at)

**Relationships:** One event has many seats (One-to-Many). One user has many orders (One-to-Many). One order is for one specific seat.

## 5. Preventing Double-Booking

To guarantee two people cannot buy the same seat, we rely on the database's ACID properties. When a user clicks "Checkout", the system runs a **database transaction** with an atomic conditional update:
`UPDATE seats SET status = 'sold' WHERE id = 123 AND status = 'available';`
If the database reports that 1 row was updated, the purchase succeeds. If it reports 0 rows updated, it means another user's transaction just changed the status to 'sold' a millisecond earlier, and the current user receives a "Seat no longer available" error. Additionally, seats placed in a "held" state have a strict 10-minute Time-To-Live (TTL). If payment isn't completed, a background worker automatically reverts the seat to 'available'.

## 6. Architecture Diagram

```text
                              [ User / Mobile Client ]
                                      |
                                      v
                                [ DNS Server ]
                               /              \
                      (Static) /                \ (API Traffic)
                             v                  v
                  [ CDN (Static Assets) ]    [ WAF / Rate Limiter ]
                                                    |
                                                    v
                                              [ Load Balancer ]
                                                    |
                                   +----------------+----------------+
                                   v                v                v
                            [ App Server 1]  [ App Server 2]  [ App Server 3]
                                   |                |                |
                                   +--------+-------+--------+-------+
                                            |                |
                                            v                v
                                    [ Cache (Redis) ]  [ Message Queue ]
                                            |                |
                                            v                v
                                    [ Read Replica ]   [ Worker (Emails/PDFs) ]
                                            ^                |
                                            |                v
                                    [ Primary DB ]     [ Object Storage (Tickets) ]
```

## Component Explanations

- **DNS & CDN:** Routes users to the nearest edge server for fast loading of the frontend app.
- **WAF / Rate Limiter:** Crucial for flash sales. It blocks bots and throttles users making too many requests, protecting the backend.
- **Load Balancer & App Servers:** Distributes API traffic. App servers are stateless so we can add more during a big sale.
- **Cache (Redis):** Stores session data and temporarily holds "reserved" seats with a 10-minute TTL.
- **Primary DB & Read Replica:** The Primary DB handles the critical write transactions (preventing double-booking). The Read Replica handles browsing events and seat maps.
- **Queue & Worker:** Asynchronously generates PDF tickets and sends confirmation emails so the checkout API responds instantly.

## 7. Trade-offs

1. **Virtual Waiting Room vs. System Crash:** During a massive flash sale, we might implement a "waiting room" queue. This trades off immediate user access for system stability, ensuring the database isn't overwhelmed by 200,000 simultaneous requests.
2. **Seat Hold Time vs. Inventory Blocking:** Holding a seat for 10 minutes gives users time to enter credit card details, but if they abandon the cart, that seat is blocked from others for 10 minutes. We trade off a slightly frustrating checkout timer for the guarantee of inventory accuracy.

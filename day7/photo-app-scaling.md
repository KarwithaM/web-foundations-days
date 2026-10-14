# SnapShare: System Scaling Plan

## 1. Assumptions and Estimates

**Assumptions:**

- Total registered users: 10,000,000
- Daily Active Users (DAU): 10% of total users = 1,000,000 users/day
- Seconds in a day: ~100,000 (for easy calculation)
- 1 active user uploads 1 photo (2 MB) and views 50 feed pages per day.

**Calculations:**

- **Average uploads per second (Write Traffic):** 1,000,000 photos / 100,000 seconds = **10 uploads/sec**.
- **Peak uploads per second (Write Traffic):** 10 uploads/sec \* 5 (peak multiplier) = **50 writes/sec**.
- **Feed views per second (Read Traffic - Average):** (1,000,000 users \* 50 views) / 100,000 seconds = **500 views/sec**.
- **Feed views per second (Read Traffic - Peak):** 500 views/sec \* 5 (peak multiplier) = **2,500 views/sec**.
- **Photo Storage per Year:** 1,000,000 photos/day _ 365 days _ 2 MB = **730 TB/year**.
- **Thumbnail Storage per Year:** 1,000,000 _ 365 _ 50 KB = **18.25 TB/year**.
- **Total Storage:** ~748 TB/year.

## 2. Read-Heavy vs. Write-Heavy

SnapShare is heavily **read-heavy** (a 50:1 ratio of reads to writes).
**Design Impact:** Because reads vastly outnumber writes, the architecture must be optimized to serve data as fast as possible. We will rely heavily on CDNs, caching (Redis), and database read replicas to handle the 2,500 peak reads/sec, while the write path (50 peak writes/sec) can remain relatively simple.

## 3. Storing Photos

**Why not in the database?** Relational databases are optimized for fast indexing and structured text, not massive binary files (BLOBs). Storing 2MB images in a DB would bloat the database, make backups take days, destroy cache efficiency, and make scaling incredibly expensive.
**Where instead?** Photos and thumbnails must be stored in **Object Storage** (like AWS S3), which is infinitely scalable, highly durable, and specifically designed for cheap binary file storage. The database will only store the _metadata_ (the URL link to the image).

## 4. Architecture Diagram

```text
                          [ User / Mobile Client ]
                          /                      \
                 (Static) /                        \ (API Traffic)
                        v                          v
             [ CDN (Images/CSS/JS) ]      [ Load Balancer ]
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
                                    [ Read Replica ]   [ Worker (Thumbnails) ]
                                            ^                |
                                            |                v
                                    [ Primary DB ]     [ Object Storage (S3) ]
                                          ^                  ^
                                          |                  |
                                          +------------------+
                              (App Servers connect directly to Object Storage
                               to upload photos and generate presigned URLs)
```

## 5. Component Explanations

- **CDN:** Serves the heavy image files and thumbnails from edge servers geographically close to the user to minimize latency and bandwidth costs.
- **Load Balancer:** Distributes incoming API traffic evenly across multiple stateless app servers to prevent any single server from crashing.
- **App Servers:** Handle the business logic (authentication, feed generation) and are stateless so they can scale horizontally.
- **Cache (Redis):** Stores the generated feed metadata in memory so we don't have to query the database every time a user scrolls.
- **Primary Database:** Stores structured metadata (user profiles, photo URLs, timestamps) and handles all write operations.
- **Read Replica:** Offloads the massive volume of read queries (like fetching feed metadata) away from the primary database.
- **Object Storage:** Cheaply and infinitely stores the actual binary photo and thumbnail files.
- **Message Queue & Worker:** Decouples the slow image processing from the main upload API. At a peak volume of 50 writes per second, the thumbnail queue receives 50 jobs per second. This peak volume directly influences the worker pool size, requiring us to scale the number of concurrent worker instances to ensure they can process at least 50 jobs per second and prevent a growing backlog.

## 6. Upload Flow (Step-by-Step)

1. The user selects a photo and clicks upload; the request hits the Load Balancer and routes to an App Server.
2. The App Server validates the user and generates a unique file name for the photo.
3. The App Server streams the 2MB photo directly to Object Storage (S3).
4. The App Server saves the photo's metadata (S3 URL, user ID, timestamp) to the Primary DB.
5. The App Server sends a "Generate Thumbnail" job to the Message Queue and immediately returns `201 Created` to the user's phone.
6. A background Worker picks up the job, downloads the photo from Object Storage, creates the 50KB thumbnail, and uploads the thumbnail back to Object Storage.
7. The Worker updates the photo's metadata in the Primary DB with the new thumbnail URL.

## 7. Trade-offs

1. **Eventual Consistency for Thumbnails:** The user uploads a photo and gets an instant success message, but the thumbnail might take a few seconds to generate and appear in the feed. We trade immediate visual perfection for a fast, highly responsive upload experience.
2. **Storage Cost vs. Performance (Caching Strategy):** Caching the entire feed for all 1 million daily users in Redis would be incredibly fast but prohibitively expensive in terms of RAM. We trade off by only caching the feeds of the top 10% most active users, accepting slightly higher database latency for the remaining 90% to save on infrastructure costs.

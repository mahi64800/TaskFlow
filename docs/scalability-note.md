# Scalability Note

This submission uses a JSON file as a zero-setup demo datastore so the project can be run immediately during review. In production, the repository layer should be switched to PostgreSQL using the provided schema in `docs/postgresql-schema.sql`.

Recommended next steps for a production rollout:

1. Move state from the JSON file store to PostgreSQL with indexed queries and migrations.
2. Put JWT secrets, database credentials, and CORS policy behind environment-based configuration.
3. Add Redis for rate limiting, caching, and session invalidation on logout or token rotation.
4. Introduce structured logging and centralized monitoring for failed auth, slow requests, and error spikes.
5. Containerize the API and frontend, then deploy behind a load balancer with horizontal autoscaling.

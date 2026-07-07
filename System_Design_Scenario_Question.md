System Design Scenario-Based Interview Questions

Level 1 -- Beginner

  A website suddenly gets 10× more traffic. What would you do?
  Your API is becoming slow. How would you debug it?
  Users are logging in at the same time and the server is overloaded.
  Your database CPU reaches 100%. How would you fix it?
  Images are loading slowly for users worldwide.
  Your application needs to support 1 million users.
  A service crashes frequently. How do you identify the cause?
  Users report duplicate orders after clicking "Pay" multiple times.
  You need to reduce API response time from 2 seconds to under 200 ms.
  Your cache is missing frequently. How would you improve it?

Level 2 -- Intermediate

  Your database has reached its storage limit. What is your scaling
    strategy?
  A microservice is timing out while calling another service.
  One Kafka consumer is much slower than the others.
  Your Redis instance goes down. What happens next?
  A deployment introduced errors. How do you roll it back?
  One Kubernetes node fails. How does the system recover?
  Your message queue has millions of pending messages.
  A third-party API starts rate limiting your application.
  Users are seeing stale data because of caching.
  How would you migrate from a monolith to microservices?

Level 3 -- Advanced Distributed Systems

  Design a system that processes 10 million events per minute.
  Design a notification service for 100 million users.
  How would you guarantee message ordering?
  How would you prevent duplicate event processing?
  Design a globally distributed cache.
  How would you shard a database with billions of records?
  How would you migrate data with zero downtime?
  Design a highly available API Gateway.
  Build a distributed scheduler similar to Kubernetes.
  Design a distributed locking service.

Level 4 -- Cloud & Kubernetes

  A Kubernetes cluster suddenly has 5,000 pods. How would you optimize
    it?
  The Kubernetes scheduler becomes a bottleneck.
  Pods keep restarting due to memory pressure.
  A cluster spans multiple regions. How do services communicate?
  You need to discover all cloud resources every 5 minutes.
  Terraform and the cloud are out of sync. How do you detect drift?
  One cloud provider is unavailable. How does your platform continue
    working?
  You need to manage infrastructure across AWS, Azure, and GCP.
  Kubernetes API Server latency suddenly increases.
  You need to deploy thousands of applications across clusters.

Level 5 -- Event-Driven Systems

  Millions of events arrive every minute. How do you process them?
  Event consumers are falling behind producers.
  Events arrive out of order. How do you handle them?
  Duplicate events are being processed.
  A Kafka broker fails unexpectedly.
  Build an event replay system.
  Design an audit logging platform.
  Design a change event observability platform.
  Process infrastructure changes in near real time.
  Correlate infrastructure events with incidents.

Level 6 -- Observability & Monitoring

  CPU usage suddenly spikes across the cluster.
  One service's latency jumps from 50 ms to 3 seconds.
  Users report intermittent errors, but logs look normal.
  Build a centralized logging platform.
  Design a metrics collection system.
  Design a distributed tracing platform.
  Alerting generates thousands of false positives.
  How do you trace a request across 20 microservices?
  Build a real-time dashboard for infrastructure health.
  Detect anomalies automatically.

Level 7 -- AI Systems

  Your chatbot has to answer questions using millions of documents.
  LLM context windows are too small. How do you solve this?
  Design a RAG system.
  Build an AI agent that can use multiple tools.
  Cache LLM responses efficiently.
  Handle thousands of concurrent AI requests.
  Build a multi-agent orchestration system.
  Design an MCP server for enterprise tools.
  Design a vector search platform.
  Reduce AI inference costs while maintaining quality.

Level 8 -- Staff Engineer / Architect

  Your company expands from one region to 20 regions. How would you
    redesign the architecture?
  A critical database becomes unavailable. How do you recover?
  Your platform now manages 100 million cloud resources.
  Design a cloud asset inventory.
  Build a cloud relationship graph.
  Correlate infrastructure changes with production incidents.
  Design a real-time compliance scanning platform.
  Your Kafka cluster reaches its throughput limit.
  Design a multi-tenant SaaS platform.
  Migrate a petabyte-scale database without downtime.

Production Incident Scenarios

  Production is down. What are your first five steps?
  Database latency suddenly increases.
  Redis is unavailable.
  Kafka is losing messages.
  Kubernetes nodes become NotReady.
  Memory usage keeps growing until the service crashes.
  API latency doubles after a deployment.
  A load balancer is sending traffic to unhealthy servers.
  DNS resolution starts failing.
  An availability zone goes down.

Architecture Trade-off Questions

  SQL or NoSQL?
  Kafka or RabbitMQ?
  Redis or Memcached?
  REST or gRPC?
  Polling or WebSockets?
  Monolith or Microservices?
  Synchronous or Asynchronous communication?
  Horizontal or Vertical scaling?
  Stateful or Stateless services?
  Event-driven or Request-response architecture?

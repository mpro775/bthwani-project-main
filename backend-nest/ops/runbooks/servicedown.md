# ServiceDown

**Severity:** CRITICAL

## Description

The BThwani backend service is not responding

## Troubleshooting Steps

1. Check if the service is running: systemctl status bthwani-backend
2. Check recent logs: journalctl -u bthwani-backend -n 100
3. Verify MongoDB is accessible: nc -zv mongodb 27017
4. Verify Redis is accessible: nc -zv redis 6379
5. Check resource usage: top, free -h, df -h
6. If OOM killed, increase memory limits
7. Restart service: systemctl restart bthwani-backend

## Escalation

If service cannot be restored in 5 minutes, page on-call engineer

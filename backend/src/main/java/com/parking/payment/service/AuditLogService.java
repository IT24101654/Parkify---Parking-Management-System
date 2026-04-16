package com.parking.payment.service;

import com.parking.payment.entity.AuditLog;
import com.parking.payment.entity.User;
import com.parking.payment.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, String details, User user) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setDetails(details);
        log.setPerformedBy(user);
        auditLogRepository.save(log);
    }

    public List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByTimestampDesc();
    }
}

package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@lombok.ToString(exclude = "user")
@lombok.EqualsAndHashCode(exclude = "user")
@Table(name = "service_center")
public class ServiceCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "working_hours")
    private String workingHours;

    @Column(name = "services_offered", length = 1000)
    private String servicesOffered;

    @Column(length = 255)
    private String address;

    @Column(name = "service_center_type")
    private String type; // e.g., General, Specialized, etc.

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "services_summary", columnDefinition = "TEXT")
    private String servicesSummary;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private User user;
}

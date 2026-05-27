package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;






import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Document
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    @Id
    
    private Long id;
    private Long userId;
    private String action;
    private LocalDateTime timestamp;
}


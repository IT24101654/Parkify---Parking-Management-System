package com.Parkify.Parkify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;


public enum Role {
    SUPER_ADMIN, PARKING_OWNER, DRIVER
}


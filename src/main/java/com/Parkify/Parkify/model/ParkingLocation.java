package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Document

public class ParkingLocation {

    @Id
    
    private Long id;

    @DBRef(lazy = true)
    
    @JsonIgnore
    private User owner;

    
    private String name;

    
    private String address;

    private Double latitude;

    private Double longitude;

    
    private String availableFrom; 

    
    private String availableTo; 

    private Boolean active = true;

    
    public ParkingLocation() {
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(String availableFrom) { this.availableFrom = availableFrom; }

    public String getAvailableTo() { return availableTo; }
    public void setAvailableTo(String availableTo) { this.availableTo = availableTo; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}



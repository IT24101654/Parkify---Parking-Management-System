package com.Parkify.Parkify.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "parking_slots")
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_place_id", nullable = false)
    @JsonIgnore
    private ParkingPlace parkingPlace;

    @Column(name = "slot_name")
    private String slotName;

    @Column(name = "slot_type")
    private String slotType; // Car, Bike, Van, EV

    @Column(name = "slot_status")
    private String slotStatus; // Available, Unavailable, Under Maintenance

    private String floor;

    private String zone;

    private String section;

    private String notes;
}

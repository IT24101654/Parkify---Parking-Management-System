package com.Parkify.Parkify.service;

import com.Parkify.Parkify.model.ServiceCenter;

import java.util.Optional;

public interface ServiceCenterService {
    ServiceCenter saveServiceCenter(ServiceCenter serviceCenter);

    Optional<ServiceCenter> getServiceCenterByUserId(Long userId);
}

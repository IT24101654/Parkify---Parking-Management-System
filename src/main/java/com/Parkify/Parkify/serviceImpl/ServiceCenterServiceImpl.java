package com.Parkify.Parkify.serviceImpl;

import java.util.Objects;
import com.Parkify.Parkify.model.ServiceCenter;
import com.Parkify.Parkify.repository.ServiceCenterRepository;
import com.Parkify.Parkify.service.ServiceCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ServiceCenterServiceImpl implements ServiceCenterService {

    @Autowired
    private ServiceCenterRepository serviceCenterRepository;

    @Override
    public ServiceCenter saveServiceCenter(ServiceCenter serviceCenter) {
        return Objects.requireNonNull(serviceCenterRepository.save(serviceCenter), "Service center could not be saved");
    }

    @Override
    public Optional<ServiceCenter> getServiceCenterByUserId(Long userId) {
        return serviceCenterRepository.findByUserId(userId);
    }
}

package com.trustchain.backend.service;

import com.trustchain.backend.model.Manage;
import com.trustchain.backend.repository.ManageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ManageService {

    @Autowired
    private ManageRepository manageRepository;

    public List<Manage> getAllManages() {
        // TODO: Implement method
        return null;
    }

    public Optional<Manage> getManageById(UUID id) {
        // TODO: Implement method
        return null;
    }

    public Manage createManage(Manage manage) {
        // TODO: Implement method
        return null;
    }

    public Manage updateManage(UUID id, Manage manage) {
        // TODO: Implement method
        return null;
    }

    public void deleteManage(UUID id) {
        // TODO: Implement method
    }
}

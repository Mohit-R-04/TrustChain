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
        return manageRepository.findAll();
    }

    public Optional<Manage> getManageById(UUID id) {
        return manageRepository.findById(id);
    }

    public Manage createManage(Manage manage) {
        return manageRepository.save(manage);
    }

    public Manage updateManage(UUID id, Manage manage) {
        return manageRepository.findById(id).map(existingManage -> {
            existingManage.setNgo(manage.getNgo());
            existingManage.setScheme(manage.getScheme());
            return manageRepository.save(existingManage);
        }).orElse(null);
    }

    public void deleteManage(UUID id) {
        manageRepository.deleteById(id);
    }
}

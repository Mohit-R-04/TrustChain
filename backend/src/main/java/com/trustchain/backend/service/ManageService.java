package com.trustchain.backend.service;

import com.trustchain.backend.model.Manage;
import com.trustchain.backend.repository.ManageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

    public List<Manage> getManagesByNgoId(UUID ngoId) {
        return manageRepository.findByNgo_NgoId(ngoId);
    }

    public Optional<Manage> getManageById(UUID id) {
        return manageRepository.findById(id);
    }

    public Manage createManage(Manage manage) {
        if (manage == null || manage.getNgo() == null || manage.getNgo().getNgoId() == null
                || manage.getScheme() == null || manage.getScheme().getSchemeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ngoId and schemeId are required");
        }

        UUID ngoId = manage.getNgo().getNgoId();
        UUID schemeId = manage.getScheme().getSchemeId();

        if (manageRepository.existsByNgo_NgoIdAndScheme_SchemeId(ngoId, schemeId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "NGO has already accepted this scheme");
        }

        if (manageRepository.existsByScheme_SchemeId(schemeId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Scheme has already been accepted by another NGO");
        }

        return manageRepository.save(manage);
    }

    public Manage updateManage(UUID id, Manage manage) {
        return manageRepository.findById(id).map(existingManage -> {
            if (manage == null || manage.getNgo() == null || manage.getNgo().getNgoId() == null
                    || manage.getScheme() == null || manage.getScheme().getSchemeId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ngoId and schemeId are required");
            }

            UUID ngoId = manage.getNgo().getNgoId();
            UUID schemeId = manage.getScheme().getSchemeId();

            if (manageRepository.existsByNgo_NgoIdAndScheme_SchemeIdAndManageIdNot(ngoId, schemeId, id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "NGO has already accepted this scheme");
            }

            if (manageRepository.existsByScheme_SchemeIdAndManageIdNot(schemeId, id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Scheme has already been accepted by another NGO");
            }

            existingManage.setNgo(manage.getNgo());
            existingManage.setScheme(manage.getScheme());
            return manageRepository.save(existingManage);
        }).orElse(null);
    }

    public void deleteManage(UUID id) {
        manageRepository.deleteById(id);
    }
}

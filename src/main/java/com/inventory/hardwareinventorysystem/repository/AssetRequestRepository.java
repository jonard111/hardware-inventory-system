package com.inventory.hardwareinventorysystem.repository;

import com.inventory.hardwareinventorysystem.model.AssetRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {

    /**
     * Returns all requests submitted by a specific requester.
     *
     * StaffController was originally calling findAll() and then manually
     * filtering with .stream().filter() — that loads every request in the
     * database into memory. This derived query delegates the filtering to
     * the database instead, which is correct.
     *
     * Usage in StaffController should be changed from:
     *   assetRequestRepository.findAll().stream()
     *       .filter(r -> fullName.equalsIgnoreCase(r.getRequestedBy()))
     *       .collect(Collectors.toList());
     *
     * To simply:
     *   assetRequestRepository.findByRequestedByIgnoreCase(fullName);
     */
    List<AssetRequest> findByRequestedBy(String requestedBy);

    // Case-insensitive variant — safer since names could be stored in mixed case.
    List<AssetRequest> findByRequestedByIgnoreCase(String requestedBy);
}
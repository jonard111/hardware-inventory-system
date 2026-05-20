package com.inventory.hardwareinventorysystem.repository;

import com.inventory.hardwareinventorysystem.model.AssetRequest;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRequestRepository extends JpaRepository<AssetRequest, Long> {

    List<AssetRequest> findByRequestedBy(String requestedBy);
}
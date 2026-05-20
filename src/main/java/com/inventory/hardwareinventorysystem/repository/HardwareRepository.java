package com.inventory.hardwareinventorysystem.repository;

import com.inventory.hardwareinventorysystem.model.Hardware;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository layer for Hardware entity.
 */
public interface HardwareRepository extends JpaRepository<Hardware, String> {

}
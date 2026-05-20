package com.inventory.hardwareinventorysystem.controller;

import com.inventory.hardwareinventorysystem.model.AssetRequest;
import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.model.User;
import com.inventory.hardwareinventorysystem.repository.AssetRequestRepository;
import com.inventory.hardwareinventorysystem.repository.HardwareRepository;
import com.inventory.hardwareinventorysystem.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

@Controller
public class StaffController {

    private final HardwareRepository hardwareRepository;
    private final AssetRequestRepository assetRequestRepository;
    private final UserRepository userRepository;

    public StaffController(
            HardwareRepository hardwareRepository,
            AssetRequestRepository assetRequestRepository,
            UserRepository userRepository
    ) {
        this.hardwareRepository = hardwareRepository;
        this.assetRequestRepository = assetRequestRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/staff-assets")
    public String staffDashboard(HttpSession session, Model model) {

        String loggedInEmail = (String) session.getAttribute("loggedInUserEmail");
        User currentUser = null;

        if (loggedInEmail != null) {
            currentUser = userRepository.findByEmail(loggedInEmail);
        }

        List<Hardware> hardwareList = hardwareRepository.findAll();
        List<AssetRequest> requestList = assetRequestRepository.findAll();

        List<String> categories = hardwareList.stream()
                .map(Hardware::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        model.addAttribute("hardwareList", hardwareList);
        model.addAttribute("requestList", requestList);
        model.addAttribute("categories", categories);
        model.addAttribute("staffName", currentUser != null ? currentUser.getFirstName() + " " + currentUser.getLastName() : "Staff Member");
        model.addAttribute("staffRole", currentUser != null ? currentUser.getRole() : "Staff");

        return "staff-dashboard";
    }

    @PostMapping("/request-asset")
    public String requestAsset(
            @RequestParam String assetId,
            @RequestParam String assetName,
            @RequestParam int quantity,
            @RequestParam String purpose,
            HttpSession session
    ) {
        String loggedInEmail = (String) session.getAttribute("loggedInUserEmail");
        User currentUser = null;

        if (loggedInEmail != null) {
            currentUser = userRepository.findByEmail(loggedInEmail);
        }

        AssetRequest request = new AssetRequest();
        request.setAssetId(assetId);
        request.setAssetName(assetName);
        request.setQuantity(quantity);
        request.setPurpose(purpose);
        request.setRequestedBy(currentUser != null ? currentUser.getFirstName() + " " + currentUser.getLastName() : "Staff Member");
        request.setStatus("Pending");

        assetRequestRepository.save(request);

        return "redirect:/staff-assets";
    }
}
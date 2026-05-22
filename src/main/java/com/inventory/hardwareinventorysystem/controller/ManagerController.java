package com.inventory.hardwareinventorysystem.controller;

import com.inventory.hardwareinventorysystem.model.AssetRequest;
import com.inventory.hardwareinventorysystem.model.Hardware;
import com.inventory.hardwareinventorysystem.model.User;
import com.inventory.hardwareinventorysystem.repository.AssetRequestRepository;
import com.inventory.hardwareinventorysystem.repository.HardwareRepository;
import com.inventory.hardwareinventorysystem.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Controller
public class ManagerController {

    private final HardwareRepository       hardwareRepository;
    private final AssetRequestRepository   assetRequestRepository;
    private final UserRepository           userRepository;

    public ManagerController(
            HardwareRepository hardwareRepository,
            AssetRequestRepository assetRequestRepository,
            UserRepository userRepository
    ) {
        this.hardwareRepository     = hardwareRepository;
        this.assetRequestRepository = assetRequestRepository;
        this.userRepository         = userRepository;
    }

    @GetMapping("/dashboard")
    public String managerDashboard(HttpSession session, Model model) {

        String loggedInEmail = (String) session.getAttribute("loggedInUserEmail");

        if (loggedInEmail == null) {
            return "redirect:/login";
        }

        User currentUser = userRepository.findByEmail(loggedInEmail);

        if (currentUser == null) {
            session.invalidate();
            return "redirect:/login";
        }

        if ("staff".equalsIgnoreCase(currentUser.getRole())) {
            return "redirect:/staff-assets";
        }

        List<Hardware> hardwareList = hardwareRepository.findAll();

        List<String> categories = hardwareList.stream()
                .map(Hardware::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        int totalAssets   = hardwareList.size();
        int totalQuantity = hardwareList.stream()
                .mapToInt(Hardware::getQuantity)
                .sum();

        List<AssetRequest> requestList = assetRequestRepository.findAll();

        long pendingCount = requestList.stream()
                .filter(r -> "Pending".equalsIgnoreCase(r.getStatus()))
                .count();

        model.addAttribute("hardwareList",  hardwareList);
        model.addAttribute("categories",    categories);
        model.addAttribute("requestList",   requestList);
        model.addAttribute("pendingCount",  pendingCount);
        model.addAttribute("totalAssets",   totalAssets);
        model.addAttribute("totalQuantity", totalQuantity);
        model.addAttribute("managerName",
                currentUser.getFirstName() + " " + currentUser.getLastName());
        model.addAttribute("managerRole",   currentUser.getRole());
        model.addAttribute("staffName",     currentUser.getFirstName() + " " + currentUser.getLastName());
        model.addAttribute("staffRole",     currentUser.getRole());
        model.addAttribute("loggedInUser",  currentUser);

        return "index";
    }
}
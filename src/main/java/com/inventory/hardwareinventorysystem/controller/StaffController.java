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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class StaffController {

    private final HardwareRepository       hardwareRepository;
    private final AssetRequestRepository   assetRequestRepository;
    private final UserRepository           userRepository;

    public StaffController(
            HardwareRepository hardwareRepository,
            AssetRequestRepository assetRequestRepository,
            UserRepository userRepository
    ) {
        this.hardwareRepository     = hardwareRepository;
        this.assetRequestRepository = assetRequestRepository;
        this.userRepository         = userRepository;
    }

    @GetMapping("/staff-assets")
    public String staffDashboard(HttpSession session, Model model) {

        String loggedInEmail = (String) session.getAttribute("loggedInUserEmail");

        // FIX #3: Redirect to login if the session has expired or was never set.
        if (loggedInEmail == null) {
            return "redirect:/login";
        }

        User currentUser = userRepository.findByEmail(loggedInEmail);

        if (currentUser == null) {
            session.invalidate();
            return "redirect:/login";
        }

        List<Hardware> hardwareList = hardwareRepository.findAll();

        String fullName = currentUser.getFirstName() + " " + currentUser.getLastName();

        // FIX: Use the repository's derived query instead of loading all requests
        // into memory and filtering in Java — much more efficient at scale.
        List<AssetRequest> myAssetList =
                assetRequestRepository.findByRequestedByIgnoreCase(fullName);

        List<String> categories = hardwareList.stream()
                .map(Hardware::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        model.addAttribute("hardwareList", hardwareList);
        model.addAttribute("myAssetList",  myAssetList);
        model.addAttribute("categories",   categories);
        model.addAttribute("staffName",    fullName);
        model.addAttribute("staffRole",    currentUser.getRole());
        

        return "staff-dashboard";
    }

    @PostMapping("/request-asset")
    public String requestAsset(
            @RequestParam String assetId,
            @RequestParam String assetName,
            @RequestParam int    quantity,
            @RequestParam String purpose,
            HttpSession session
    ) {
        try {
            String loggedInEmail = (String) session.getAttribute("loggedInUserEmail");

            if (loggedInEmail == null) {
                return "redirect:/login";
            }

            User currentUser = userRepository.findByEmail(loggedInEmail);

            if (currentUser == null) {
                return "redirect:/login";
            }

            Hardware hardware = hardwareRepository.findById(assetId).orElse(null);

            if (hardware == null) {
                return "redirect:/staff-assets";
            }

            if (quantity <= 0 || quantity > hardware.getQuantity()) {
                return "redirect:/staff-assets";
            }

            AssetRequest request = new AssetRequest();

            request.setAssetId(assetId);
            request.setAssetName(assetName);

            // FIX #6: Persist the category so the staff "My Assets" table shows it.
            request.setCategory(hardware.getCategory());

            request.setQuantity(quantity);
            request.setPurpose(purpose);
            request.setRequestedBy(
                    currentUser.getFirstName() + " " + currentUser.getLastName()
            );
            request.setStatus("Pending");

            // FIX #5: Set the timestamp — this line was missing (blank line in original).
            request.setDateCreated(
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
            );

            assetRequestRepository.save(request);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "redirect:/staff-assets";
    }
}
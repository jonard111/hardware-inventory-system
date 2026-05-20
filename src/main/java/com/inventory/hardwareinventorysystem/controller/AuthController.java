package com.inventory.hardwareinventorysystem.controller;

import com.inventory.hardwareinventorysystem.model.User;
import com.inventory.hardwareinventorysystem.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register-user")
    public String registerUser(User user, Model model) {

        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            model.addAttribute("error", "Email already registered.");
            return "register";
        }

        userRepository.save(user);

        return "redirect:/";
    }

    @PostMapping("/login-user")
    public String loginUser(
            @RequestParam String email,
            @RequestParam String password,
            Model model,
            HttpSession session
    ) {

        User user = userRepository.findByEmail(email);

        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("loggedInUserEmail", email);

            if (user.getRole().equals("staff")) {
                return "redirect:/staff-assets";
            }

            if (user.getRole().equals("manager")) {
                return "redirect:/dashboard";
            }

            return "redirect:/";
        }

        model.addAttribute("error", "Invalid email or password.");
        return "login";
    }
}
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

    //  ACCOUNT NOT FOUND
    if (user == null) {
        model.addAttribute("error", "Account doesn't exist.");
        return "login";
    }

    //  WRONG PASSWORD
    if (!user.getPassword().equals(password)) {
        model.addAttribute("error", "Incorrect password.");
        return "login";
    }

    // SUCCESS LOGIN
    session.setAttribute("loggedInUserEmail", email);

    if ("staff".equalsIgnoreCase(user.getRole())) {
        return "redirect:/staff-assets";
    }

    if ("manager".equalsIgnoreCase(user.getRole())) {
        return "redirect:/dashboard";
    }

    return "redirect:/";
}
}

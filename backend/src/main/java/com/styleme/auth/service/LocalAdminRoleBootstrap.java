package com.styleme.auth.service;

import com.styleme.user.entity.Role;
import com.styleme.user.entity.RoleEnum;
import com.styleme.user.entity.User;
import com.styleme.user.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

@Component
public class LocalAdminRoleBootstrap {

    private final RoleRepository roleRepository;
    private final String configuredEmail;
    private final Environment environment;

    public LocalAdminRoleBootstrap(
            RoleRepository roleRepository,
            Environment environment,
            @Value("${styleme.auth.local-admin-email:}") String configuredEmail) {
        this.roleRepository = roleRepository;
        this.environment = environment;
        this.configuredEmail = configuredEmail;
    }

    public boolean grantAdminRoleIfConfigured(User user) {
        if (!environment.acceptsProfiles(Profiles.of("local"))
                || configuredEmail.isBlank()
                || !configuredEmail.trim().equalsIgnoreCase(user.getEmail())) {
            return false;
        }

        if (user.getRoles().stream().anyMatch(role ->
                role.getName() == RoleEnum.ROLE_ADMIN || role.getName() == RoleEnum.ROLE_SUPER_ADMIN)) {
            return false;
        }

        Role adminRole = roleRepository.findByName(RoleEnum.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(
                        new Role(RoleEnum.ROLE_ADMIN, "Store administrator with management capabilities")));
        user.addRole(adminRole);
        return true;
    }
}

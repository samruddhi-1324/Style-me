package com.styleme.auth.service;

import com.styleme.user.entity.Role;
import com.styleme.user.entity.RoleEnum;
import com.styleme.user.entity.User;
import com.styleme.user.repository.RoleRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LocalAdminRoleBootstrapTests {

    @Test
    void grantsAdminRoleToConfiguredEmailOnlyInLocalProfile() {
        RoleRepository roleRepository = mock(RoleRepository.class);
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("local");
        LocalAdminRoleBootstrap bootstrap = new LocalAdminRoleBootstrap(
                roleRepository, environment, "admin@example.com");
        Role adminRole = new Role(RoleEnum.ROLE_ADMIN, "Store administrator");
        User user = new User("ADMIN@example.com", "hash", "Local", "Admin");
        user.setId(UUID.randomUUID());
        when(roleRepository.findByName(RoleEnum.ROLE_ADMIN)).thenReturn(Optional.of(adminRole));

        assertTrue(bootstrap.grantAdminRoleIfConfigured(user));
        assertTrue(user.getRoles().contains(adminRole));
    }

    @Test
    void doesNotGrantAdminRoleOutsideLocalProfile() {
        RoleRepository roleRepository = mock(RoleRepository.class);
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");
        LocalAdminRoleBootstrap bootstrap = new LocalAdminRoleBootstrap(
                roleRepository, environment, "admin@example.com");
        User user = new User("admin@example.com", "hash", "Local", "Admin");

        assertFalse(bootstrap.grantAdminRoleIfConfigured(user));
        verifyNoInteractions(roleRepository);
        assertTrue(user.getRoles().isEmpty());
    }

    @Test
    void doesNotGrantAdminRoleToAnotherEmail() {
        RoleRepository roleRepository = mock(RoleRepository.class);
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("local");
        LocalAdminRoleBootstrap bootstrap = new LocalAdminRoleBootstrap(
                roleRepository, environment, "admin@example.com");
        User user = new User("customer@example.com", "hash", "Local", "Customer");

        assertFalse(bootstrap.grantAdminRoleIfConfigured(user));
        verifyNoInteractions(roleRepository);
        assertTrue(user.getRoles().isEmpty());
    }
}

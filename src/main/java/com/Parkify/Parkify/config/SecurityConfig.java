package com.Parkify.Parkify.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/users/register", "/api/users/login",
                                "/api/users/forgot-password",
                                "/api/users/reset-password",
                                "/api/users/profile-image/**",
                                "/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/users/*/verify-nic").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/profile").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/*/upload-image").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAuthority("ROLE_SUPER_ADMIN")
                        .requestMatchers("/api/vehicles/**").authenticated()
                        .requestMatchers("/api/vehicles/docs/**").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
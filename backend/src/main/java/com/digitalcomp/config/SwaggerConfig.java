package com.digitalcomp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Digital Complaint Management System API")
                        .version("1.0.0")
                        .description("""
                                Enterprise Complaint Management System with SLA + Notifications.
                                
                                **Features:**
                                - Raise and track complaints
                                - Admin complaint assignment and resolution
                                - Automatic SLA escalation
                                - Role-based access control (USER / ADMIN)
                                - Email/log notifications
                                
                                **Complaint Flow:** RAISED → IN_PROGRESS → ESCALATED → RESOLVED → CLOSED
                                """)
                        .contact(new Contact()
                                .name("Digital Complaint System")
                                .email("admin@digitalcomp.com")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token")));
    }
}

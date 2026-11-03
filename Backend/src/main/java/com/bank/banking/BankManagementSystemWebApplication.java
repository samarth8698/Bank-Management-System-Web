package com.bank.banking;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BankManagementSystemWebApplication {

    private static final Logger logger =
            LoggerFactory.getLogger(
                    BankManagementSystemWebApplication.class);

    public static void main(String[] args) {

        SpringApplication.run(
                BankManagementSystemWebApplication.class,
                args);
    }

    // ================= DATABASE CONNECTION CHECK =================

    @Bean
    CommandLineRunner databaseCheck(DataSource dataSource) {

        return args -> {

            logger.info("========== DATABASE CONNECTION CHECK ==========");

            try (
                    Connection connection = dataSource.getConnection();
                    Statement statement = connection.createStatement();
                    ResultSet rs = statement.executeQuery(
                            "SELECT DATABASE(), @@hostname, @@port"
                    )
            ) {

                if (rs.next()) {

                    logger.info("DATABASE NAME : {}", rs.getString(1));
                    logger.info("HOSTNAME     : {}", rs.getString(2));
                    logger.info("PORT         : {}", rs.getString(3));
                }

                try (
                        ResultSet customers = statement.executeQuery(
                                "SELECT id, email, role FROM customers"
                        )
                ) {

                    logger.info("========== DATABASE CUSTOMERS ==========");

                    while (customers.next()) {

                        logger.info(
                                "ID={}, EMAIL={}, ROLE={}",
                                customers.getLong("id"),
                                customers.getString("email"),
                                customers.getString("role")
                        );
                    }
                }

            } catch (Exception e) {

                logger.error("Database verification failed!", e);
            }

            logger.info("==============================================");
        };
    }
}

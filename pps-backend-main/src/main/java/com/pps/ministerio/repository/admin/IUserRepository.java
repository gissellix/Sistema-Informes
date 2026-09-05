package com.pps.ministerio.repository.admin;

import com.pps.ministerio.model.Personal;
import com.pps.ministerio.model.UserSec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<UserSec, Long> , JpaSpecificationExecutor {
    Optional<UserSec> findUserEntityByUsername(String username);
    Optional<UserSec> existsByPersonal(Personal personal);
    List<UserSec> findByAccountNotLockedFalse();
}

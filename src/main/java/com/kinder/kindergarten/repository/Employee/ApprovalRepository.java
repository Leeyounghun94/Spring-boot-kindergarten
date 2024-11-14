package com.kinder.kindergarten.repository.employee;

import com.kinder.kindergarten.constant.employee.ApprovalStatus;
import com.kinder.kindergarten.entity.employee.Approval;
import com.kinder.kindergarten.entity.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByPositionAndStatus(Employee position, ApprovalStatus status);
    List<Approval> findByRequester(Employee requester);
}

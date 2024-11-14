package com.kinder.kindergarten.service.employee;

import com.kinder.kindergarten.constant.employee.DayOff;
import com.kinder.kindergarten.DTO.employee.LeaveDTO;

import com.kinder.kindergarten.entity.employee.Employee;
import com.kinder.kindergarten.entity.employee.Leave;
import com.kinder.kindergarten.repository.employee.EmployeeRepository;
import com.kinder.kindergarten.repository.employee.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;

    private final ApprovalService approvalService;
    private final EmployeeService employeeService;

    // 휴가 신청
    @Transactional
    public void requestLeave(LeaveDTO leaveDTO, Employee employee) {
        // 연차 잔여일수 확인
        double requestedLeaveDays = calculateLeaveDays(leaveDTO);
        if (employee.getAnnualLeave() < requestedLeaveDays) {
            throw new IllegalStateException("연차 잔여일수가 부족합니다.");
        }

        Leave leave = Leave.builder()
                .employee(employee)
                .start(leaveDTO.getLe_start())
                .end(leaveDTO.getLe_end())
                .type(DayOff.valueOf(leaveDTO.getLe_type()))
                .title(leaveDTO.getLe_title())
                .total(requestedLeaveDays)
                .le_reason(leaveDTO.getLe_reason())
                .status("대기")
                .build();

//        employee.setAnnualLeave(employee.getAnnualLeave() - requestedLeaveDays);
//
//        employeeRepository.save(employee);
        // 휴가 정보 저장
//        leaveRepository.save(leave);
        Leave savedLeave = leaveRepository.save(leave);
        // 결재자 찾기 (예: 부서장)
        Employee position = employeeService.findDepartmentHead(employee.getDepartment());

        // 결재 요청 생성
        approvalService.createLeaveApproval(employee, position, savedLeave);
    }

    // 휴가 일수 계산
    private double calculateLeaveDays(LeaveDTO dto) {
        // 종료일이 null인 경우 시작일을 종료일로 사용
        LocalDate endDate = (dto.getLe_end() != null) ? dto.getLe_end() : dto.getLe_start();

        // 시작일과 종료일 간의 일수 계산
        double daysBetween = ChronoUnit.DAYS.between(dto.getLe_start(), endDate) + 1; // 포함하기 위해 +1

        // 요청된 휴가의 타입에 따른 실제 사용일수 반환
        DayOff dayOffType = DayOff.valueOf(dto.getLe_type());
        return daysBetween * dayOffType.getDays();
    }

    // 직원별 휴가 조회
    public List<LeaveDTO> getLeavesByEmployee(Employee employee) {
        return leaveRepository.findByEmployee(employee).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LeaveDTO convertToDTO(Leave leave) {
        return LeaveDTO.builder()
                .le_id(leave.getId())
                .le_start(leave.getStart())
                .le_end(leave.getEnd())
                .le_type(leave.getType().toString())
                .le_total(leave.getTotal())
                .le_reason(leave.getLe_reason())
                .le_status(leave.getStatus())
                .build();
    }

    public Leave getLeaveById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("휴가 신청을 찾을 수 없습니다."));
    }
}


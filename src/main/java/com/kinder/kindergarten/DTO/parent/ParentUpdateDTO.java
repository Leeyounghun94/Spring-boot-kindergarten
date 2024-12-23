package com.kinder.kindergarten.DTO.parent;

import com.kinder.kindergarten.constant.parent.ParentType;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ParentUpdateDTO {

    // ERP에 등록된 학부모의 정보를 수정하는 DTO

    private Long parentId; //학부모 고유 ID (PK)

    private String parentName; // 학부모 성함

    private String parentPhone;   //학부모 핸드폰 번호

    private String childrenEmergencyPhone;    // 비상 연락처

    private String parentAddress; //학부모 주소

    private ParentType parentType;  // 자녀와의 관계
}

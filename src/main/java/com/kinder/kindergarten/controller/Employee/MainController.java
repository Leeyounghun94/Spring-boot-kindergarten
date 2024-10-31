package com.kinder.kindergarten.controller.Employee;

import com.kinder.kindergarten.config.PrincipalDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@RequiredArgsConstructor
@Log4j2
public class MainController {

    @GetMapping(value = "/")
    public String main(){
        return "main";
    }
}
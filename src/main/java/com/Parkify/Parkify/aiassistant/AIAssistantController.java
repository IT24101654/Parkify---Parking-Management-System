package com.Parkify.Parkify.aiassistant;

import com.Parkify.Parkify.aiassistant.dto.AIParkingRequestDTO;
import com.Parkify.Parkify.aiassistant.dto.AIParkingResponseDTO;
import com.Parkify.Parkify.dto.ServiceApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai-assistant")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @PostMapping("/recommend")
    public ResponseEntity<ServiceApiResponse<AIParkingResponseDTO>> recommendParking(
            @RequestBody AIParkingRequestDTO request) {
        
        AIParkingResponseDTO bestPlace = aiAssistantService.recommend(request);
        
        return ResponseEntity.ok(
                ServiceApiResponse.success("AI Recommendation calculated successfully", bestPlace)
        );
    }
}



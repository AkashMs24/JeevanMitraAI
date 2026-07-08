/**
 * AI Disease Detection using Vision API
 * Analyzes crop images for diseases and pests
 */

class DiseaseDetector {
    async analyzeImage(file) {
        showLoading('🔬 Analyzing disease with AI vision...');

        try {
            const base64 = await imageToBase64(file);
            
            const prompt = `Analyze this crop image for diseases, pests, or health issues.

            Provide response in JSON format:
            {
                "disease": "disease name",
                "confidence": "percentage",
                "severity": "low/medium/high",
                "symptoms": "list of visible symptoms",
                "treatment": "recommended treatment steps",
                "prevention": "prevention methods",
                "urgency": "action needed immediately/soon/optional"
            }`;

            const response = await groqAPI.chat(prompt);
            
            // Parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const diseaseData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response);

            hideLoading();
            return diseaseData;
        } catch (error) {
            hideLoading();
            showToast(`❌ ${error.message}`, 'error');
            throw error;
        }
    }
}

const diseaseDetector = new DiseaseDetector();

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!groqAPI.isConfigured()) {
        showToast('❌ API key not configured', 'error');
        return;
    }

    diseaseDetector.analyzeImage(file).then(result => {
        displayDiseaseResult(result);
    });
}

// Handle drag and drop
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        document.getElementById('diseaseImageInput').files = event.dataTransfer.files;
        handleImageUpload({ target: { files: [file] } });
    }
}

// Display disease results
function displayDiseaseResult(data) {
    document.getElementById('imageUploadArea').style.display = 'none';
    document.getElementById('diseaseResultContainer').style.display = 'block';
    
    document.getElementById('diseaseName').textContent = data.disease || 'Unknown';
    document.getElementById('diseaseSymptoms').textContent = data.symptoms || '--';
    document.getElementById('diseaseTreatment').textContent = data.treatment || '--';
    document.getElementById('diseasePrevention').textContent = data.prevention || '--';
    
    const severityEl = document.getElementById('severityLevel');
    severityEl.textContent = `Severity: ${data.severity?.toUpperCase()}`;
    severityEl.className = `severity-indicator severity-${data.severity}`;
}

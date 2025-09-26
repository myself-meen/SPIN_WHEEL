class SpinWheelGame {
    constructor() {
        this.sections = this.loadSections();
        this.currentSection = 0;
        this.isSpinning = false;
        this.selectedSectionIndex = null;
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    // Load sections from localStorage or create default
    loadSections() {
        const saved = localStorage.getItem('spinWheelSections');
        return saved ? JSON.parse(saved) : Array(20).fill(null).map(() => ({ statements: ['', '', ''] }));
    }

    // Save sections to localStorage
    saveSections() {
        localStorage.setItem('spinWheelSections', JSON.stringify(this.sections));
    }

    initializeElements() {
        this.elements = {
            statement1: document.getElementById('statement1'),
            statement2: document.getElementById('statement2'),
            statement3: document.getElementById('statement3'),
            saveBtn: document.getElementById('save-section'),
            editBtn: document.getElementById('edit-mode'),
            resetBtn: document.getElementById('reset-all'),
            spinBtn: document.getElementById('spin-btn'),
            keepBtn: document.getElementById('keep-section'),
            removeBtn: document.getElementById('remove-section'),
            currentSectionSpan: document.getElementById('current-section'),
            totalSectionsSpan: document.getElementById('total-sections'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            results: document.getElementById('results'),
            selectedSectionNum: document.getElementById('selected-section-num'),
            resultStatements: [
                document.getElementById('result-statement1'),
                document.getElementById('result-statement2'),
                document.getElementById('result-statement3')
            ]
        };
    }

    bindEvents() {
        this.elements.saveBtn.addEventListener('click', () => this.saveSection());
        this.elements.editBtn.addEventListener('click', () => this.enterEditMode());
        this.elements.resetBtn.addEventListener('click', () => this.resetAll());
        this.elements.spinBtn.addEventListener('click', () => this.spinWheel());
        this.elements.keepBtn.addEventListener('click', () => this.keepSection());
        this.elements.removeBtn.addEventListener('click', () => this.removeSection());
        
        // Enter key support
        [this.elements.statement1, this.elements.statement2, this.elements.statement3].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.saveSection();
            });
        });
    }

    saveSection() {
        const statements = [
            this.elements.statement1.value.trim(),
            this.elements.statement2.value.trim(),
            this.elements.statement3.value.trim()
        ];

        if (statements.some(s => s === '')) {
            alert('Please fill in all three statements.');
            return;
        }

        this.sections[this.currentSection].statements = statements;
        this.saveSections();
        this.clearInputs();
        this.nextSection();
        this.updateDisplay();
    }

    nextSection() {
        // Find next empty section or stay at current if all filled
        for (let i = 0; i < this.sections.length; i++) {
            if (this.sections[i].statements[0] === '') {
                this.currentSection = i;
                return;
            }
        }
        // All sections filled
        this.currentSection = 0;
    }

    clearInputs() {
        this.elements.statement1.value = '';
        this.elements.statement2.value = '';
        this.elements.statement3.value = '';
    }

    enterEditMode() {
        this.currentSection = 0;
        this.loadCurrentSection();
        this.updateDisplay();
    }

    loadCurrentSection() {
        const section = this.sections[this.currentSection];
        this.elements.statement1.value = section.statements[0];
        this.elements.statement2.value = section.statements[1];
        this.elements.statement3.value = section.statements[2];
    }

    resetAll() {
        if (confirm('Are you sure you want to reset all sections? This cannot be undone.')) {
            this.sections = Array(20).fill(null).map(() => ({ statements: ['', '', ''] }));
            this.currentSection = 0;
            this.saveSections();
            this.clearInputs();
            this.hideResults();
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.updateProgress();
        this.updateSectionInfo();
        this.drawWheel();
    }

    updateProgress() {
        const filledSections = this.sections.filter(s => s.statements[0] !== '').length;
        const percentage = (filledSections / this.sections.length) * 100;
        
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${filledSections}/${this.sections.length} sections filled`;
        
        this.elements.spinBtn.disabled = filledSections === 0;
    }

    updateSectionInfo() {
        this.elements.currentSectionSpan.textContent = this.currentSection + 1;
        this.elements.totalSectionsSpan.textContent = this.sections.length;
    }

    get sectionAngle() {
        return (2 * Math.PI) / this.sections.length;
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.sections.length === 0) {
            this.ctx.fillStyle = '#A1C2BD';
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = '#19183B';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('No Sections', centerX, centerY);
            return;
        }
        
        const colors = ['#19183B', '#708993', '#A1C2BD', '#E7F2EF'];
        
        this.sections.forEach((section, i) => {
            const startAngle = i * this.sectionAngle;
            const endAngle = (i + 1) * this.sectionAngle;
            const color = colors[i % colors.length];
            
            // Draw section
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#E7F2EF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw section number
            const textAngle = startAngle + this.sectionAngle / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
            
            this.ctx.fillStyle = color === '#E7F2EF' ? '#19183B' : '#E7F2EF';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(i + 1, textX, textY);
            
            // Add filled indicator
            if (section.statements[0] !== '') {
                this.ctx.beginPath();
                this.ctx.arc(centerX + Math.cos(textAngle) * (radius * 0.9), 
                           centerY + Math.sin(textAngle) * (radius * 0.9), 6, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#708993';
                this.ctx.fill();
                this.ctx.strokeStyle = '#E7F2EF';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    spinWheel() {
        if (this.isSpinning || this.sections.length === 0) return;
        
        const filledSections = this.sections.map((section, index) => 
            section.statements[0] !== '' ? index : null
        ).filter(index => index !== null);
        
        if (filledSections.length === 0) return;
        
        this.isSpinning = true;
        this.elements.spinBtn.disabled = true;
        this.hideResults();
        
        const randomIndex = Math.floor(Math.random() * filledSections.length);
        this.selectedSectionIndex = filledSections[randomIndex];
        
        const targetAngle = (this.selectedSectionIndex * this.sectionAngle) + (this.sectionAngle / 2);
        const spinAngle = (Math.PI * 2 * 5) + targetAngle;
        
        this.canvas.style.transform = `rotate(${spinAngle}rad)`;
        
        setTimeout(() => {
            this.showResults();
            this.isSpinning = false;
            this.elements.spinBtn.disabled = false;
        }, 4000);
    }

    showResults() {
        const section = this.sections[this.selectedSectionIndex];
        
        this.elements.selectedSectionNum.textContent = this.selectedSectionIndex + 1;
        this.elements.resultStatements.forEach((element, index) => {
            element.textContent = section.statements[index];
        });
        
        this.elements.results.style.display = 'block';
        this.elements.results.scrollIntoView({ behavior: 'smooth' });
    }

    hideResults() {
        this.elements.results.style.display = 'none';
    }

    keepSection() {
        this.hideResults();
    }

    removeSection() {
        if (this.selectedSectionIndex !== null) {
            this.sections.splice(this.selectedSectionIndex, 1);
            this.saveSections();
            this.hideResults();
            this.canvas.style.transform = 'rotate(0rad)';
            
            // Adjust current section if needed
            if (this.currentSection >= this.selectedSectionIndex) {
                this.currentSection = Math.max(0, this.currentSection - 1);
            }
            
            this.updateDisplay();
            
            if (this.sections.length === 0) {
                alert('All sections removed! You can add new sections or reset the wheel.');
            }
        }
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpinWheelGame();
});
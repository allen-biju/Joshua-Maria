/* --- RSVP Simplified Form Handler --- */

export class RSVPHandler {
  constructor(onSuccessCallback) {
    this.onSuccess = onSuccessCallback;
    
    // Elements
    this.form = document.getElementById('rsvp-form');
    this.nameInput = document.getElementById('rsvp-name');
    this.submitBtn = document.getElementById('rsvp-submit-btn');
    this.successScreen = document.getElementById('rsvp-success');
    
    this.init();
  }

  init() {
    if (!this.form) return;
    
    // Bind form submit
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  handleSubmit() {
    const name = this.nameInput.value.trim();
    if (!name) {
      this.showFieldError(this.nameInput, 'Please enter your full name');
      return;
    }
    this.clearFieldError(this.nameInput);
    this.submitForm();
  }

  showFieldError(input, msg) {
    this.clearFieldError(input);
    input.style.borderColor = 'var(--color-rose)';
    
    const errorMsg = document.createElement('span');
    errorMsg.className = 'field-error-message';
    errorMsg.style.color = 'var(--color-rose)';
    errorMsg.style.fontSize = '0.75rem';
    errorMsg.style.display = 'block';
    errorMsg.style.marginTop = '4px';
    errorMsg.textContent = msg;
    
    input.parentNode.appendChild(errorMsg);
  }

  clearFieldError(input) {
    input.style.borderColor = '';
    const errorSpan = input.parentNode.querySelector('.field-error-message');
    if (errorSpan) {
      errorSpan.remove();
    }
  }

  async submitForm() {
    if (!this.submitBtn) return;
    
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = 'Submitting...';

    // Collect Form Data
    const attendance = this.form.querySelector('input[name="rsvp-attendance"]:checked').value;
    const name = this.nameInput.value.trim();

    const payload = {
      timestamp: new Date().toISOString(),
      name,
      attendance
    };

    console.log("Submitting RSVP Data Payload: ", payload);

    // Mock API post request simulating Google Spreadsheet Webhook
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
      
      // Complete UI Transition on Success
      this.form.style.display = 'none';
      
      // Update success message customized to attendance choice
      const successMessage = document.getElementById('rsvp-success-message');
      if (attendance === 'no') {
        successMessage.innerHTML = `Thank you, ${name}. Your response has been received. We are sorry you cannot make it, but we appreciate your prayers and blessings.`;
      } else {
        successMessage.innerHTML = `Thank you, ${name}! Your RSVP has been received. We look forward to celebrating our Holy Matrimony with you on 21 November 2026.`;
      }

      this.successScreen.style.display = 'block';
      
      if (this.onSuccess) {
        this.onSuccess();
      }
    } catch (err) {
      console.error("Submission failed: ", err);
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Submit RSVP';
      alert("Submission encountered a network error. Please try again.");
    }
  }
}

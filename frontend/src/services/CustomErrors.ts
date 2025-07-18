interface FieldError {
  field: string;
  message: string;
}

class EmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailError";
  }
}

class UsernameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsernameError";
  }
}

class DetailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DetailError";
  }
}

class GeneralApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeneralApiError";
  }
}

class MultipleFieldErrors extends Error {
  public errors: FieldError[];

  constructor(errors: FieldError[]) {
    super();
    this.name = "MultipleFieldErrors";
    this.errors = errors;
  }

  toString(): string {
    return this.errors.map(error => `${error.field}: ${error.message}`).join("\n");
  }
}

export { EmailError, UsernameError, DetailError, GeneralApiError, MultipleFieldErrors };

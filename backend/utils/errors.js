class CustomError extends Error {
    constructor(name, message, status, data) {
      super(message);
      this.status = status;
      this.name = name;
      this.data = data;
    }
}

export default CustomError; 
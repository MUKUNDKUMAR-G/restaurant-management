const formatResponse = (res, name, message, status, data) => {
    return res.status(status).json({
      name,
      message,
      data,
    });
  };  

export default formatResponse;
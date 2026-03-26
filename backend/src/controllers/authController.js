import { loginService } from '../services/authService.js';

export const login = async (request, response, next) => {
  try {
    const result = await loginService(request.body);

    response.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

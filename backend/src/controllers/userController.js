import { createUserService, getUsersService } from '../services/userService.js';

export const getUsers = async (_request, response, next) => {
  try {
    const users = await getUsersService();

    response.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (request, response, next) => {
  try {
    const user = await createUserService(request.body);

    response.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

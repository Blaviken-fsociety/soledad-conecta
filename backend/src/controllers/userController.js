import {
  changeMyPasswordService,
  createEntrepreneurRequestService,
  createPasswordResetRequestService,
  createUserService,
  deleteUserService,
  getUsersService,
  updateUserService,
} from '../services/userService.js';

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

export const createEntrepreneurRequest = async (request, response, next) => {
  try {
    const user = await createEntrepreneurRequestService(request.body);

    response.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createPasswordResetRequest = async (request, response, next) => {
  try {
    const resetRequest = await createPasswordResetRequestService(request.body);

    response.status(201).json({
      success: true,
      data: resetRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (request, response, next) => {
  try {
    const user = await updateUserService(request.params.id, request.body);

    response.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (request, response, next) => {
  try {
    await deleteUserService(request.params.id);

    response.status(200).json({
      success: true,
      data: {
        deleted: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changeMyPassword = async (request, response, next) => {
  try {
    const user = await changeMyPasswordService(request.auth, request.body);

    response.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

import User from "../../models/User";
import AppError from "../../errors/AppError";

const DeleteUserService = async (id: string | number): Promise<void> => {
  const user = await User.findOne({
    where: { id }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  await user.destroy();
};

export default DeleteUserService;

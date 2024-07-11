const { searchOverdueBooks } = require("../models/loanModel");
const { createFine, getFineByUserId } = require("../models/finesModel");
const { sendEmailNotification } = require("./notificationService");
const { getUserById } = require("../models/usersModel");
require("dotenv").config();

/**
 * Verifies if the loan is overdue and sends an email notification if it is.
 */
const checkOverdueLoan = async () => {
  console.log("verify loans");
  const loans = await searchOverdueBooks();
  if (loans.length >= 1) {
    try {
      for (const loan of loans) {
        const fineExist = await getFineByUserId(loan.fk_user_id, {
          bookId: loan.fk_book_id
        });
        if (fineExist.length == 0) {
          const [user] = await getUserById(loan.fk_user_id);
          const dueDate = new Date();
          dueDate.setDate(
            dueDate.getDate() + Number(process.env.RETURN_INTERVAL_DAYS)
          );
          const fine = await createFine({
            amount: Number(process.env.FINE_AMOUNT),
            dueDate: dueDate,
            userId: loan.fk_user_id,
            bookId: loan.fk_book_id,
            loanId: loan.loan_id
          });
          console.log(fine);
          sendEmailNotification(
            user.email,
            "Overdue Book 📕",
            `The book you borrowed was not returned within the stipulated deadline, then you will be charged a fee of $5.0 dollars, you have until ${dueDate.toLocaleString().split(",")[0]} to make the payment`,
            `<h1>Overdue book</h1> <br> <p>The book you borrowed was not returned within the stipulated deadline, then you will be charged a fee of $5.0 dollars, you have until ${dueDate.toLocaleString().split(",")[0]} to make the payment</p>`
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = {
  checkOverdueLoan
};

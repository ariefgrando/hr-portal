var oracledb = require('oracledb');

oracledb.getConnection(
  {
    user          : "absenbsi",
    password      : "absenbsi",
    connectString : "10.16.1.42/ABSEN"
  },
  function(err, connection)
  {
    if (err) {
      console.error(err.message);
      return;
    }
    connection.execute(
      "select NAME from userinfo"
    + "WHERE SSN = '8608020A'",
      function(err, result)
      {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(result.rows);
      });
  });
  
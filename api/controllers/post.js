import { db } from "../db.js";
import jwt from "jsonwebtoken";
export const getPosts = (req, res) => {
  const q = req.query.cat
    ? "select * from posts where category=?"
    : "select * from posts";
  db.query(q, [req.query.cat], (err, data) => {
    if (err) return res.send(err);

    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {
  // console.log(req.query);
  // const params =URLSearchParams;

  const q = "select uid from posts where id=?";
  const uid = db.query(q, req.params.id, (err, data) => {
    if (err) return res.send(err);

    console.log(data[0].uid);
    const userid = data[0].uid;
    const username = `select username , img from user where id = ?`;
    db.query(username, userid, (err, data) => {
      if (err) return res.send(err);
      console.log(username, data);
      const name = data[0].username;
      const userimg = data[0].img;
      const q2 =
        "select `id` , `title` , `desc`, `img`, `category`, `date` from posts where id=?";
      db.query(q2, req.params.id, (err, data) => {
        if (err) return res.send(err);
        console.log(data);
        const result = {
          username: name,
          userimg: userimg,
          ...data[0],
        };
        console.log("result", result);
        return res.status(200).json(result);
      });
    });
  });
  // console.log(uid.data)
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(403).json("Not Authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("token is not valid");
    console.log(req.body);
    const q =
      "insert into posts(`title`,`desc`,`img`,`category`,`date`,`uid`) values(?)";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.send(err);
      return res.json("post created");
    });
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;

  if (!token) return res.status(401).json("Not Authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("token is not valid");

    const postId = req.params.id;
    const q = "delete from posts where `id` = ? AND `uid`=?";
    db.query(q, [postId, userInfo.id], (err, data) => {
      if (err) return res.status(403).json("post does not belong to you");

      return res.json("post has been deleted!");
    });
  });
};

export const updatePost = (req, res) => {
  console.log(req.cookies);
  const token = req.cookies.access_token;

  if (!token) return res.status(403).json("Not Authenticated!");

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("token is not valid");
    const postid = req.params.id;
    const q =
      "update posts set `title`=?,`desc`=?,`img`=?,`category`=? where `id`=? and `uid`=?";
    const values = [req.body.title, req.body.desc, req.body.img, req.body.cat];

    db.query(q, [...values, postid, userInfo.id], (err, data) => {
      if (err) return res.json(err);
      return res.json("post updated!");
    });
  });
};

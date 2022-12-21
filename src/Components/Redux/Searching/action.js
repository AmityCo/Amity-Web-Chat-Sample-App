export const SEARCH_LOADING = "SEARCH_LOADING";
export const SEARCH_ERROR = "SEARCH_ERROR";
export const SEARCH_RESULT = "SEARCH_RESULT";

export const searhcLoding = (payload) => ({ type: SEARCH_LOADING, payload });
export const searchError = (payload) => ({ type: SEARCH_ERROR, payload });
export const searchResult = (payload) => ({ type: SEARCH_RESULT, payload });

import { PostRepository, UserRepository } from "@amityco/js-sdk";

async function queryAllUser(keyword) {
  const liveUserCollection = UserRepository.queryUsers({
    keyword: keyword,
    // filter?: 'all' | 'flagged',
    // sortBy?: 'lastCreated' | 'firstCreated' | 'displayName'
  });

  // filter if flagCount is > 0
  // lastCreated: sort: createdAt desc
  // firstCreated: sort: createdAt asc
  // displayName: sort: alphanumerical asc
  let resultArr = [];
  liveUserCollection.on("dataUpdated", (models) => {
    resultArr = models;
    //  models.map((model) => console.log(model.userId));
  });
  return resultArr;
}
export const makeSearchApi = (search) => async (dispatch) => {
  searhcLoding(true);
  const user = JSON.parse(localStorage.getItem("userInfo")) || {};
  const url = `https://messenger-clo.herokuapp.com/auth?search=${search}`;

  try {
    const liveUserCollection = UserRepository.queryUsers({
      keyword: search,
      // filter?: 'all' | 'flagged',
      // sortBy?: 'lastCreated' | 'firstCreated' | 'displayName'
    });
    console.log("pass this");
    // let res = await fetch(url, {
    //   method: "get",
    //   headers: {
    //     "content-type": "application/json",
    //     Authorization: `Bearer ${user.token}`,
    //   },
    // });
    liveUserCollection.on("dataUpdated", (models) => {
      console.log("models: ", models);
      const mappedModel = models.map((model) => {
        return {
          _id: model.userId,
          name: model.displayName,
        };
      });

      dispatch(searchResult(mappedModel));
    });
    // console.log("res: ", res);
    // let data = await res.json();
    // console.log("data: ", data);

    // dispatch(searchResult(data));
  } catch (err) {
    dispatch(searchError(true));
    console.log(err.message);
  }
};

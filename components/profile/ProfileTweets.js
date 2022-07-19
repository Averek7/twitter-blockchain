import { useContext } from "react";
import TwitterContext from "../../context/TwitterContext";
import Post from "../Post";

const style = {
  wrapper: `no-scrollbar`,
  header: `sticky top-0 bg-[#15202b] z-10 p-4 flex justify-between items-center`,
  headerTitle: `text-xl font-bold`,
};

function ProfileTweets() {
  const { currentUser } = useContext(TwitterContext);
  return (
    <div className={style.wrapper}>
      {currentUser.tweets?.map((tweet, index) => (
        <Post
          key={index}
          displayName={
            currentUser.name === "Unnamed"
              ? `${currentUser.walletAddress.slice(
                  0,
                  4
                )}....${currentUser.walletAddress.slice(41)} `
              : currentUser.name
          }
          username={`${currentUser.walletAddress.slice(
            0,
            4
          )}....${currentUser.walletAddress.slice(-4)}`}
          text={tweet.tweet}
          avatar={currentUser.profileImage}
          isProfileImageNft={tweet.isProfileImageNft}
          timestamp={tweet.timestamp}
        />
      ))}
    </div>
  );
}

export default ProfileTweets;

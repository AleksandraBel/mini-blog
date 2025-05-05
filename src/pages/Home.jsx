import PostsList from "../components/PostList";

const Home = () => {
  return (
    <div>
      <h1 className="text-2x1 font-semibold p-4">Всі пости</h1>
      <PostsList />
    </div>
  );
};

export default Home;

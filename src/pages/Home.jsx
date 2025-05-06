import PostsList from "../components/PostList";

const Home = () => {
  return (
    <div className="container border border-black bg-white">
      <h1 className="text-xl font-bold mb-1">Всі пости</h1>
      <PostsList />
    </div>
  );
};

export default Home;

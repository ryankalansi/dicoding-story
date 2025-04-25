export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <div class="skip-link">
          <a href="#content" class="skip-to-content">Skip to content</a>
        </div>
        
        <h1 id="content" tabindex="0">About Dicoding Stories</h1>
        
        <div class="about-content">
          <p>Dicoding Stories is a platform for Dicoding community members to share their journey, experiences, and moments related to Dicoding.</p>
          
          <h2>Features</h2>
          <ul>
            <li>Browse stories from other Dicoding learners</li>
            <li>Create and share your own stories with photos</li>
            <li>Add location information to your stories</li>
            <li>View stories on an interactive map</li>
          </ul>
          
          <h2>How to Use</h2>
          <ol>
            <li>Register an account or continue as guest</li>
            <li>Browse stories on the home page</li>
            <li>Click on a story to view details</li>
            <li>Use the "+" button to add your own story</li>
            <li>Take a photo with your camera</li>
            <li>Select a location on the map (optional)</li>
            <li>Write a description and submit</li>
          </ol>
          
          <p>We hope you enjoy sharing and exploring stories from the Dicoding community!</p>
        </div>
      </section>
    `;
  }
}

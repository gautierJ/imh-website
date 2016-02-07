<?php

namespace Application\Sonata\MediaBundle\Provider;

use Sonata\MediaBundle\Provider\YouTubeProvider;
use Sonata\MediaBundle\Model\MediaInterface;
use Gaufrette\Filesystem;
use Sonata\MediaBundle\CDN\CDNInterface;
use Sonata\MediaBundle\Generator\GeneratorInterface;
use Buzz\Browser;
use Sonata\MediaBundle\Thumbnail\ThumbnailInterface;
use Sonata\MediaBundle\Metadata\MetadataBuilderInterface;

class CustomYouTubeProvider extends YouTubeProvider
{

    /* @var boolean */
    protected $html5;

    /**
     * @param string                                                $name
     * @param \Gaufrette\Filesystem                                 $filesystem
     * @param \Sonata\MediaBundle\CDN\CDNInterface                  $cdn
     * @param \Sonata\MediaBundle\Generator\GeneratorInterface      $pathGenerator
     * @param \Sonata\MediaBundle\Thumbnail\ThumbnailInterface      $thumbnail
     * @param \Buzz\Browser                                         $browser
     * @param \Sonata\MediaBundle\Metadata\MetadataBuilderInterface $metadata
     * @param boolean                                               $html5
     */
    public function __construct($name, Filesystem $filesystem, CDNInterface $cdn, GeneratorInterface $pathGenerator, ThumbnailInterface $thumbnail, Browser $browser, MetadataBuilderInterface $metadata = null, $html5 = true)
    {
        parent::__construct($name, $filesystem, $cdn, $pathGenerator, $thumbnail, $browser, $metadata);
        $this->html5 = $html5;
    }


    /**
     * {@inheritdoc}
     */
    public function getHelperProperties(MediaInterface $media, $format, $options = array())
    {
        // Override html5 value if $options['html5'] is a boolean
        if (!isset($options['html5'])) {
            $options['html5'] = $this->html5;
        }

        // documentation : http://code.google.com/apis/youtube/player_parameters.html
        $default_player_url_parameters = array(

            // Values: 0 or 1. Default is 0. Setting this to 1 will enable the Javascript API.
            // For more information on the Javascript API and how to use it, see the JavaScript
            // API documentation.
            'enablejsapi'       => 1,

            // Value can be any alphanumeric string. This setting is used in conjunction with the
            // JavaScript API. See the JavaScript API documentation for details.
            'playerapiid'       => 'ytplayer',

            // Values: 0 or 1. Default is 0. Setting to 1 enables the fullscreen button. This has no
            // effect on the Chromeless Player. Note that you must include some extra arguments to
            // your embed code for this to work.
            'fs'                => 1,

            // Values: 1 or 3. Default is 1. Setting to 1 will cause video annotations to be shown by
            // default, whereas setting to 3 will cause video annotation to not be shown by default.
            'iv_load_policy'    => 3,

            // Values: 0, 1, or 2. Default is 1. This parameter indicates whether the video player
            // controls will display. For IFrame embeds that load a Flash player, it also defines
            // when the controls display in the player as well as when the player will load:

            // controls=0 – Player controls do not display in the player. For IFrame embeds, the Flash player loads immediately.
            // controls=1 – Player controls display in the player. For IFrame embeds, the controls display immediately and the Flash player also loads immediately.
            // controls=2 – Player controls display in the player. For IFrame embeds, the controls display and the Flash player loads after the user initiates the video playback.
            'controls'          => 0,

            // Values: 0 or 1. Default is 0. Setting to 1 enables a border around the entire video
            // player. The border's primary color can be set via the color1 parameter, and a
            // secondary color can be set by the color2 parameter.
            'border' => 0,

            // Values: Any RGB value in hexadecimal format. color1 is the primary border color, and
            // color2 is the video control bar background color and secondary border color.
            'color1'            => null,
            'color2'            => null,

            // Values: 0 or 1. Default is 1. Setting to 0 causes the player to not display information
            // like the video title and rating before the video starts playing.
            'showinfo'          => 0,

            // Values: 'window' or 'opaque' or 'transparent'.
            // When wmode=window, the Flash movie is not rendered in the page.
            // When wmode=opaque, the Flash movie is rendered as part of the page.
            // When wmode=transparent, the Flash movie is rendered as part of the page.
            'wmode'             => 'transparent'
        );

        $default_player_parameters = array(

            // Values: 0 or 1. Default is 0. Setting to 1 enables a border around the entire video
            // player. The border's primary color can be set via the color1 parameter, and a
            // secondary color can be set by the color2 parameter.
            'border'            => $default_player_url_parameters['border'],

            // Values: 'allowfullscreen' or empty. Default is 'allowfullscreen'. Setting to empty value disables
            //  the fullscreen button.
            'allowFullScreen'   => $default_player_url_parameters['fs'] == '1' ? true : false,

            // The allowScriptAccess parameter in the code is needed to allow the player SWF to call
            // functions on the containing HTML page, since the player is hosted on a different domain
            // from the HTML page.
            'allowScriptAccess' => isset($options['allowScriptAccess']) ? $options['allowScriptAccess'] : 'always',

            // Values: 'window' or 'opaque' or 'transparent'.
            // When wmode=window, the Flash movie is not rendered in the page.
            // When wmode=opaque, the Flash movie is rendered as part of the page.
            // When wmode=transparent, the Flash movie is rendered as part of the page.
            'wmode' => $default_player_url_parameters['wmode']

        );

        $player_url_parameters = array_merge($default_player_url_parameters, isset($options['player_url_parameters']) ? $options['player_url_parameters'] : array());

        $box = $this->getBoxHelperProperties($media, $format, $options);

        $player_parameters = array_merge($default_player_parameters, isset($options['player_parameters']) ? $options['player_parameters'] : array(), array(
            'width' => $box->getWidth(),
            'height' => $box->getHeight()
        ));

        $params = array(
            'html5' => $options['html5'],
            'player_url_parameters' => http_build_query($player_url_parameters),
            'player_parameters' => $player_parameters
        );

        return $params;
    }

    /**
     * Replace 4/3 by 16/9 format
     * Possible Formats :
     * default
     * mqdefault -> medium quality
     * hqdefault -> high quality
     * sddefault
     * maxresdefault
     *
     * {@inheritdoc}
     */
    public function getReferenceImage(MediaInterface $media)
    {
        $url = $media->getMetadataValue('thumbnail_url');
        $pattern = '/\bhqdefault\b/i';
        $sddefault_url = preg_replace($pattern, 'sddefault', $url);
        //var_dump($sddefault_url);
        //exit();

        return $sddefault_url;
    }
}
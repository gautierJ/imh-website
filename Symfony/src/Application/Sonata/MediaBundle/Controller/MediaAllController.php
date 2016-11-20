<?php

namespace Application\Sonata\MediaBundle\Controller;

use Sonata\MediaBundle\Controller\MediaController as BaseMediaController;
use Sonata\MediaBundle\Model\MediaInterface;
use Sonata\MediaBundle\Provider\MediaProviderInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class MediaAllController extends BaseMediaController
{
    /**
     * @throws NotFoundHttpException
     *
     * @param int $id
     * @param string $format
     *
     * @return Response
     */
    public function viewAction($id = null, $format = 'reference')
    {
        $mediaAll = $this->getAll();

        if (!$mediaAll) {
            throw new NotFoundHttpException('Unable to retrieve the medias');
        }

        $thumbnailFormat = 'default_small';
        $options = array();

        foreach($mediaAll as $key => $value)
        {
            $provider = $this->container->get($value->getProviderName());
            $format_definition = $provider->getFormat($thumbnailFormat);

            $options[$key]['id'] = $value->getId();
            $options[$key]['title'] = $value->getName();
            $options[$key]['width'] = '';
            $options[$key]['height'] = '';

            if ($format_definition['width']) {
                $options[$key]['width'] = $format_definition['width'];
            }
            if ($format_definition['height']) {
                $options[$key]['height'] = $format_definition['height'];
            }

            $options[$key]['src'] = $provider->generatePublicUrl($value, $thumbnailFormat);

            $providerReference = $value->getProviderReference();

            $options[$key]['jsonData'] = $this->getApiJsonInformations($providerReference);
            $options[$key]['duration'] = $this->convertISO8601Duration($options[$key]['jsonData']['duration']);

            if($value->getId() == $this->getRequest()->get('id')) {
                $options[$key]['current'] = 'active';
            }
        }

        $response = $this->render('SonataMediaBundle:Media:media_gallery.html.twig', array(
            'options' => $options,
            'format'  => $format
        ));

        // cache for 3600 seconds
        $response->setSharedMaxAge(3600);

        // (optional) set a custom Cache-Control directive
        $response->headers->addCacheControlDirective('must-revalidate', true);

        return $response;
    }

    /**
     * Retrieve JSON data from Youtube API V3 for current video
     *
     * @param string $providerReference
     *
     * @return array $jsonResponseList
     */
    public function getApiJsonInformations($providerReference)
    {
        $apiKey = 'AIzaSyCQ7eJRRYdjqGm5Fsge53wbpSlN-FfqUOs';
        $url = 'https://www.googleapis.com/youtube/v3/videos?id='.$providerReference.'&key='.$apiKey.'&part=snippet,contentDetails,statistics,status';
        $data = file_get_contents($url);

        if (!$data) {
            throw new \RuntimeException('Unable to read' . $url);
        }

        $metadata = json_decode($data);

        if (!$metadata) {
            throw new \RuntimeException('Unable to decode the video information for :' . $data);
        }

        $jsonResponseList = array(
            'title'     => $metadata->items[0]->snippet->title,
            'duration'  => $metadata->items[0]->contentDetails->duration,
            'viewCount' => $metadata->items[0]->statistics->viewCount
        );

        return $jsonResponseList;
    }

    /**
     * Convert the format of the video duration
     * PT#H#M#S -> #:#:#
     *
     * @return string
     */
    public function convertISO8601Duration($str) {
        preg_match_all('/\d+/', $str, $matches);

        for($i=1; $i<=2; $i++) {
            if(isset($matches[0][$i])) {
                if (1 === preg_match_all( '/[0-9]/', $matches[0][$i])) {
                    $zeroBefore = '0'.$matches[0][$i];
                    $matches[0][$i] = $zeroBefore;
                }
            }
        }
        return implode(':', $matches[0]);
    }

    /**
     * Retrieve all medias with custom youtube provider
     *
     * @return MediaInterface
     */
    public function getAll()
    {
        return $this->get('sonata.media.manager.media')->findBy(
            array('providerName' => 'sonata.media.provider.custom'),
            array('createdAt' => 'DESC')
        );
    }
}